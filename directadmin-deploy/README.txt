================================================
  FILES CHO DIRECTADMIN NODEJS SELECTOR
================================================

CAC BUOC DEPLOY:

1. Upload ZIP vao: public_html/app/
2. Extract ZIP
3. DirectAdmin -> Setup Node.js App
   - Node: 20.x
   - Root: /home/hcef73f2fe/domains/canhohanghieu.com/public_html/app
   - Startup: server.js
4. SSH: npm install --production
5. SSH: npx prisma generate
6. SSH: npx prisma db push
7. SSH: chmod 777 public/uploads
8. DirectAdmin -> START

QUAN TRONG: 
- KHONG upload node_modules
- DirectAdmin se tu tao node_modules

