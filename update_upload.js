const fs = require('fs');
const file = 'app/dashboard/upload/page.tsx';
const content = fs.readFileSync(file, 'utf8');

const returnStartIndex = content.indexOf('  return (\n    <div className="w-full');
const newReturn = `  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar bg-slate-50/30">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        
        {/* Global Page Filters - Premium Floating Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm border border-slate-200/60">
          {user?.role === 'admin' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-[200px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Location</span>
              <select 
                className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all"
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {locationsList.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Client</span>
            <select 
              className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all"
              value={selectedClientName}
              onChange={e => {
                setSelectedClientName(e.target.value);
                setSelectedProductType('');
              }}
            >
              <option value="">Select Client</option>
              {Array.from(new Set(clientsList.map(p => p.name))).sort().map(name => (
                <option key={name as string} value={name as string}>{name as string}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Product</span>
            <select 
              className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedProductType}
              onChange={e => setSelectedProductType(e.target.value)}
              disabled={!selectedClientName}
            >
              <option value="">Select Product</option>
              {clientsList.filter(c => c.name === selectedClientName).map(p => (
                <option key={p.id} value={p.product_type}>{p.product_type}</option>
              ))}
            </select>
          </div>

          {user?.role === 'admin' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-[200px]">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest pl-2">Admin Proxy</span>
              <select 
                className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-4 py-2.5 text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all"
                value={targetEmployeeId}
                onChange={e => setTargetEmployeeId(e.target.value)}
              >
                <option value="">Select Target User</option>
                {usersList.map(u => (
                  <option key={u.employee_id} value={u.employee_id}>{u.name} ({u.employee_id})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row-reverse gap-8">
          
          {/* RIGHT SIDE: Validation Sidebar */}
          <div className="w-full lg:w-[380px] flex-shrink-0 space-y-6">
            <Card className="border-slate-200/60 shadow-sm rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-5 px-6">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-bold text-slate-800 text-base">Column Validation</span>
                </CardTitle>
                <CardDescription className="text-xs font-medium mt-1">
                  {selectedClient ? \`\${activeHeaders.length} required headers checked.\` : 'Select a client to view required columns.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {isValidating ? (
                  <div className="flex flex-col items-center py-16 text-slate-400 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                    <p className="text-sm font-semibold tracking-wide">Analyzing structure...</p>
                  </div>
                ) : !validationResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border flex items-center gap-4 bg-slate-50/80 border-slate-100 shadow-inner">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-white border border-slate-200 text-slate-500">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Required Columns</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {selectedClient ? 'Must match exactly' : 'Select a client first'}
                        </p>
                      </div>
                    </div>
                    {selectedClient && (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                        {activeHeaders.map((req: any) => (
                          <div key={req.key} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-100/60">
                            <span className="text-xs font-semibold text-slate-700">{req.display}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Required</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={\`p-4 rounded-2xl border flex items-center gap-4 \${validationResult.isValid ? 'bg-emerald-50 border-emerald-100 shadow-inner' : 'bg-red-50 border-red-100 shadow-inner'}\`}>
                      <div className={\`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm \${validationResult.isValid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}\`}>
                        {validationResult.isValid ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className={\`text-base font-black \${validationResult.isValid ? 'text-emerald-700' : 'text-red-700'}\`}>
                          {validationResult.isValid ? 'Ready to Upload' : 'Errors Found'}
                        </p>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">{validationResult.foundHeaders.length}/{activeHeaders.length} matched perfectly</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                      {activeHeaders.map((req: any) => {
                        const found = validationResult.foundHeaders.includes(req.display);
                        return (
                          <div key={req.key} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-100/60">
                            <span className={\`text-xs font-bold \${found ? 'text-slate-800' : 'text-slate-400'}\`}>{req.display}</span>
                            {found ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Badge variant="destructive" className="text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-md">Missing</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!validationResult.isValid && (
                      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex gap-3 shadow-inner">
                        <Info className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-900 leading-relaxed font-medium">
                          <span className="font-bold block mb-1">Action Required</span> Rename the missing columns in your Excel sheet to match the list exactly.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* LEFT SIDE: Main Upload Workspace */}
          <div className="flex-1 space-y-6">
            
            {/* Main Upload Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              
              {/* Header inside Upload Card */}
              <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25">
                      <Upload className="w-6 h-6 text-white" style={{ strokeWidth: 2.5 }} />
                    </div>
                    Data Upload
                  </h2>
                  <p className="text-sm text-slate-500 font-medium ml-[3.75rem]">Drag & drop your files securely into the workspace.</p>
                </div>
                
                {/* Timers & Date Info */}
                <div className="flex flex-col sm:items-end gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {globalDate && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{globalDate}</span>
                      </div>
                    )}
                    {countdown && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm">
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="text-xs font-black text-amber-700 tabular-nums tracking-wide">{countdown}</span>
                        <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest ml-1 hidden sm:inline">left</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Selection Bar */}
              {dateOptions.length > 0 && (
                <div className="px-8 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center gap-4">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Date</span>
                   <div className="flex bg-slate-50 border border-slate-200/60 rounded-2xl p-1 shadow-inner">
                     {dateOptions.map((opt) => (
                       <button
                         key={opt.value}
                         onClick={() => setSelectedDate(opt.value)}
                         className={\`px-5 py-2 rounded-xl text-xs font-bold transition-all \${selectedDate === opt.value ? 'bg-white shadow-sm border border-slate-200/50 text-primary scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}\`}
                       >
                         {opt.display}
                       </button>
                     ))}
                   </div>
                   {user?.role === 'admin' && (
                     <input 
                       type="date" 
                       className="bg-white border border-slate-200/60 rounded-2xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all"
                       value={selectedDate}
                       onChange={(e) => setSelectedDate(e.target.value)}
                     />
                   )}
                </div>
              )}

              {/* Dropzone Area */}
              <div className="p-8 flex flex-col flex-1">
                <label
                  className={\`group relative flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 flex-1 min-h-[300px]
                    \${isDragOver ? 'border-primary bg-primary/5 scale-[1.01] shadow-[0_0_40px_rgba(79,125,255,0.1)]' : file ? 'border-primary/40 bg-gradient-to-b from-primary/5 to-transparent' : 'border-slate-300 bg-slate-50/50 hover:border-primary/50 hover:bg-slate-100/50 hover:shadow-xl hover:-translate-y-1'}\`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDragOver(false); 
                    if (e.dataTransfer.files[0]) {
                      setFile(e.dataTransfer.files[0]);
                      setValidationResult(null);
                      setMessage("");
                      setNeedsPassword(false);
                      setFilePassword("");
                    }
                  }}
                >
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    className="sr-only" 
                    onChange={handleFileChange} 
                  />

                  <div className={\`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 \${file ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/40 scale-110' : 'bg-white border border-slate-200 text-slate-400 shadow-sm group-hover:scale-110 group-hover:text-primary group-hover:border-primary/30 group-hover:shadow-xl'}\`}>
                    {file ? <FileSpreadsheet className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                  </div>

                  {file ? (
                    <div className="text-center px-4">
                      <p className="text-lg font-black text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-1 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB <span className="mx-2">•</span> {validationResult?.rowCount || 0} rows found</p>
                      <Button variant="ghost" size="sm" onClick={(e) => { 
                        e.preventDefault(); 
                        setFile(null); 
                        setValidationResult(null);
                        setValidatedData(null);
                        setMessage("");
                        setNeedsPassword(false);
                        setFilePassword("");
                        setIsValidating(false);
                        setUploading(false);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }} className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs h-9 px-4 rounded-xl">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <p className="text-lg font-black text-slate-800">Drag & Drop your file here</p>
                      <p className="text-sm text-slate-400 mt-2 font-medium">or click to browse from your computer</p>
                      <div className="mt-4 flex items-center justify-center gap-3">
                         <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">.XLSX</span>
                         <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">.XLS</span>
                         <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">.CSV</span>
                      </div>
                    </div>
                  )}
                </label>

                {/* Password Prompt */}
                {needsPassword && (
                  <div className="mt-6 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 text-amber-800">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <span className="text-sm font-black block">Protected File</span>
                        <span className="text-xs font-medium opacity-80">Enter password to decrypt and read contents</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="password" 
                        placeholder="Enter file password" 
                        className="flex-1 rounded-2xl border border-amber-300 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                        value={filePassword}
                        onChange={(e) => setFilePassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && validateFile()}
                      />
                      <Button
                        onClick={() => validateFile()}
                        disabled={!filePassword || isValidating}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 h-auto rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                      >
                        {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Decrypt & Verify'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => validateFile()}
                    disabled={!file || !selectedClient || isValidating || uploading}
                    className="flex-1 py-7 rounded-2xl text-sm font-bold shadow-sm transition-all border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:-translate-y-0.5"
                    size="lg"
                    variant="outline"
                  >
                    {isValidating ? (
                      <><Loader2 className="w-5 h-5 mr-3 animate-spin text-primary" /> Scanning Document...</>
                    ) : (
                      <>Validate Data Format</>
                    )}
                  </Button>

                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading || !validationResult?.isValid || !selectedDate || !selectedClient}
                    className={\`flex-[2] py-7 rounded-2xl text-base font-black shadow-xl transition-all duration-300 \${
                      (validationResult?.isValid && selectedDate && selectedClient) 
                        ? 'bg-gradient-to-r from-primary to-blue-600 hover:shadow-[0_12px_40px_rgba(37,99,235,0.3)] text-white hover:-translate-y-1 border-none' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none'
                    }\`}
                    size="lg"
                  >
                    {uploading ? (
                      <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing Upload...</>
                    ) : (
                      <>Upload & Process <ArrowRight className="w-5 h-5 ml-3 opacity-70" /></>
                    )}
                  </Button>
                </div>

                {message && (
                  <div className={\`mt-6 flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold border \${message.includes('Error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}\`}>
                    {message.includes('Error') ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    {message}
                  </div>
                )}

              </div>
            </div>

            {/* Validation Data Results */}
            {validatedData && (
              <div className="animate-in slide-in-from-bottom-4 space-y-6">
                {validationView === 'summary' && (
                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => setValidationView('valid')}
                      className="flex flex-col items-center justify-center p-8 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-[2rem] transition-all shadow-sm group hover:-translate-y-1"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-4xl font-black text-emerald-700">{validatedData.valid.length}</span>
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-2">Valid Rows</span>
                    </button>
                    
                    <button 
                      onClick={() => setValidationView('invalid')}
                      className="flex flex-col items-center justify-center p-8 bg-red-50 hover:bg-red-100 border border-red-200 rounded-[2rem] transition-all shadow-sm group hover:-translate-y-1"
                    >
                      <AlertCircle className="w-10 h-10 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-4xl font-black text-red-700">{validatedData.invalid.length}</span>
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest mt-2">Error Rows</span>
                    </button>
                  </div>
                )}
                
                {validationView === 'valid' && (
                  <ValidationTable 
                    data={validatedData.valid} 
                    type="valid" 
                    onClose={() => setValidationView('summary')} 
                  />
                )}
                
                {validationView === 'invalid' && (
                  <ValidationTable 
                    data={validatedData.invalid} 
                    type="invalid" 
                    onClose={() => setValidationView('summary')} 
                  />
                )}
              </div>
            )}

            {/* Live Progress Card */}
            {activeJob && (
              <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[2rem] overflow-hidden animate-in slide-in-from-bottom-8 duration-500 mt-6 bg-white">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-5 px-8">
                  <CardTitle className="text-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                         <Activity className="w-4 h-4 text-primary animate-pulse" />
                       </div>
                       <span className="font-black text-slate-800">Live Progress</span>
                     </div>
                     <Badge variant="outline" className="bg-white font-bold text-[10px] px-3 py-1 rounded-full border-slate-200">
                       Job ID: {activeJob.id.slice(0, 8)}
                     </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {activeJob.status === 'COMPLETED' ? 'Done' : 'Processing Records...'}
                      </p>
                      <p className="text-4xl font-black text-slate-900 tracking-tight">
                        {activeJob.processed_rows.toLocaleString()} <span className="text-xl font-bold text-slate-300">/ {activeJob.total_rows.toLocaleString()}</span>
                      </p>
                    </div>
                    <p className="text-3xl font-black text-primary tracking-tighter">{progressPercent}%</p>
                  </div>

                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner">
                    <div 
                      className={\`h-full rounded-full transition-all duration-700 ease-out \${activeJob.status === 'FAILED' ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-blue-400'}\`}
                      style={{ width: \`\${progressPercent}%\` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      {activeJob.status === 'PROCESSING' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      <span className="text-slate-400">Status:</span> 
                      <span className={activeJob.status === 'COMPLETED' ? 'text-emerald-500' : activeJob.status === 'FAILED' ? 'text-red-500' : 'text-primary'}>{activeJob.status}</span>
                    </div>
                  </div>

                  {/* Show Error / Warning Details */}
                  {activeJob.error_log && (
                    <div className="mt-4 p-5 rounded-2xl text-xs font-semibold border bg-slate-50 border-slate-200">
                      {(() => {
                        let parsed: any = activeJob.error_log;
                        if (typeof parsed === 'string') {
                          try { parsed = JSON.parse(parsed); } catch {}
                        }
                        
                        if (typeof parsed === 'string') {
                          return <div className="text-red-600 flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> <span>{parsed}</span></div>;
                        } else if (parsed && typeof parsed === 'object') {
                          return (
                            <div className="flex flex-col gap-3 text-slate-600">
                              {parsed.duplicates_found > 0 && (
                                <div className="text-amber-600 flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                  <AlertCircle className="w-5 h-5" />
                                  <span>Marked <strong>{parsed.duplicates_found} records</strong> as duplicate.</span>
                                </div>
                              )}
                              {parsed.failed_count > 0 && (
                                <div className="text-red-600 flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                                  <XCircle className="w-5 h-5" />
                                  <span>Failed to insert <strong>{parsed.failed_count} records</strong>.</span>
                                </div>
                              )}
                              {parsed.last_error && <div className="text-red-600 mt-2 flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> Error: {parsed.last_error}</div>}
                              {parsed.details && Array.isArray(parsed.details) && parsed.details.length > 0 && (
                                <div className="mt-3 max-h-40 overflow-y-auto rounded-xl bg-red-50 p-4 border border-red-100 no-scrollbar shadow-inner">
                                  <p className="text-[10px] font-black text-red-800 mb-2 uppercase tracking-widest">Error Details (Upload Cancelled):</p>
                                  <ul className="list-disc pl-5 space-y-1.5">
                                    {parsed.details.map((err: string, i: number) => (
                                      <li key={i} className="text-xs font-semibold text-red-700 leading-tight">{err}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {(!parsed.duplicates_found && !parsed.failed_count && !parsed.last_error && !parsed.details) && (
                                <div className="text-emerald-600 flex items-start gap-3"><CheckCircle2 className="w-5 h-5 shrink-0" /> <span>{parsed.status || 'Success'}</span></div>
                              )}
                            </div>
                          );
                        } else {
                          return <div className="text-red-600 flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> <span>{String(parsed)}</span></div>;
                        }
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
`;

const updatedContent = content.substring(0, returnStartIndex) + newReturn + '\n}\n';
fs.writeFileSync(file, updatedContent);
console.log('Successfully updated the upload page structure.');
