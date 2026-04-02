import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
import dotenv from 'dotenv';
dotenv.config();
import { User } from './models/index.js';
import mongoose from 'mongoose';

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const u = await User.findOne({ email: 'omkarraichur0102@gmail.com' });
  console.log('USER_FOUND:', u ? u.email : 'NONE');
  console.log('ROLE:', u ? u.role : 'N/A');
  await mongoose.disconnect();
} catch (e) {
  console.error('ERROR:', e.message);
}
process.exit(0);
