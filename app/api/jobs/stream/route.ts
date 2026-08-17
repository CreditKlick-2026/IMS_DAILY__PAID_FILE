import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return new Response('Job ID required', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendUpdate = async () => {
        if (isClosed) return true;
        try {
          const res = await query(
            `SELECT id, status, total_rows, processed_rows, error_log FROM upload_jobs WHERE id = $1`,
            [jobId]
          );
          if (res.rows.length > 0) {
            const job = res.rows[0];
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(job)}\n\n`));
            
            if (job.status === 'COMPLETED' || job.status === 'FAILED') {
              isClosed = true;
              controller.close();
              return true;
            }
          }
        } catch (e) {
          if (!isClosed) {
            isClosed = true;
            controller.error(e);
          }
          return true;
        }
        return false;
      };

      await sendUpdate();

      // High-speed 300ms real-time progress push
      const interval = setInterval(async () => {
        const done = await sendUpdate();
        if (done) clearInterval(interval);
      }, 300);

      req.signal.onabort = () => {
        clearInterval(interval);
        if (!isClosed) {
          isClosed = true;
          controller.close();
        }
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // disables proxy buffering on AWS Nginx / CloudFront / ALB
    },
  });
}
