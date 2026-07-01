import { getIncentiveData } from '../service';

export async function GET(req: Request) {
    return getIncentiveData(req, 'Uttam Nagar');
}
