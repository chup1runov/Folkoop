import ctypes as c, re, sys
from pathlib import Path
pq=c.CDLL('/tmp/folkoop-postgres-20261106/package/native/lib/libpq.dylib')
for name,args,ret in [('PQconnectdb',[c.c_char_p],c.c_void_p),('PQstatus',[c.c_void_p],c.c_int),('PQexec',[c.c_void_p,c.c_char_p],c.c_void_p),('PQresultStatus',[c.c_void_p],c.c_int),('PQresultErrorMessage',[c.c_void_p],c.c_char_p),('PQntuples',[c.c_void_p],c.c_int),('PQnfields',[c.c_void_p],c.c_int),('PQfname',[c.c_void_p,c.c_int],c.c_char_p),('PQgetvalue',[c.c_void_p,c.c_int,c.c_int],c.c_char_p),('PQclear',[c.c_void_p],None),('PQfinish',[c.c_void_p],None)]:
 f=getattr(pq,name);f.argtypes=args;f.restype=ret
conn=pq.PQconnectdb(b'host=127.0.0.1 port=55486 user=postgres dbname='+sys.argv[1].encode())
assert pq.PQstatus(conn)==0
variables={}
def execute(sql):
 sql=re.sub(r":'([a-zA-Z_][a-zA-Z_0-9]*)'",lambda m:"'"+variables[m[1]].replace("'","''")+"'",sql)
 result=pq.PQexec(conn,sql.encode());status=pq.PQresultStatus(result)
 if status not in (0,1,2):
  error=pq.PQresultErrorMessage(result).decode();pq.PQclear(result);raise RuntimeError(error)
 rows=[{pq.PQfname(result,j).decode():pq.PQgetvalue(result,i,j).decode() for j in range(pq.PQnfields(result))} for i in range(pq.PQntuples(result))]
 pq.PQclear(result);return rows
try:
 for filename in sys.argv[2:]:
  print('RUN',filename,flush=True)
  if filename=='--create':execute("CREATE DATABASE folkoop_test ENCODING 'UTF8' TEMPLATE template0");continue
  sql=re.sub(r'^\\set ON_ERROR_STOP on\s*$', '',Path(filename).read_text(),flags=re.M)
  parts=re.split(r'\\(gset|gexec)\s*\n',sql)
  for i in range(0,len(parts),2):
   chunk=parts[i]
   if not chunk.strip():continue
   rows=execute(chunk)
   if i+1<len(parts):
    if parts[i+1]=='gset':
     assert len(rows)==1,(filename,rows);variables.update(rows[0])
    else:
     for row in rows:
      for statement in row.values():execute(statement)
  print('PASS',filename,flush=True)
finally:pq.PQfinish(conn)
