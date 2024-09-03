# Kinee
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftrileafu%2Fkinee%2F&env=JWT_SECRET,MONGO_URI)  
  
Sebuah contoh aplikasi menggunakan akun dengan sistem _login_, _register_, dan _dashboard_.

## _Tech Stack_

- [Angular](https://angular.io) (_front-end_)
- [Vercel Serverless](https://vercel.com/docs/functions/runtimes/node-js) (_back-end_)
- [MongoDB Atlas](https://cloud.mongodb.com) (_database_)
- [Node.js](https://nodejs.org) (_runtime_)

## _Environment Variables_
`JWT_SECRET`: _String_ digunakan untuk menandatangani (_sign_) token akun.  
`MONGO_URI`: URI untuk terhubung ke server MongoDB beserta kredensialnya.

## Fitur

### _Login_

- Dapat memilih penyimpanan akun ke `sessionStorage` atau `localStorage`

### _Register_

- Validasi email dan minimum kata sandi
- Informasi pribadi berupa nama lengkap dan jenis kelamin

### _Dashboard_

- Menyapa menggunakan nama lengkap dan hormat sesuai jenis kelamin

## Catatan

- Kata sandi yang disimpan di _database_ sudah dihash menggunakan [bcryptjs](https://npmjs.com/package/bcryptjs)
- Sesi _login_ akun berlaku untuk 8 jam
