import * as dotenv from 'dotenv';

import { SetupObject } from '../models';

dotenv.config();

const setupConfigs: SetupObject = {
	username: process.env.IP as string,
	password: process.env.PASSWORD as string,
	start: parseInt(process.env.START as string, 10),
	end: parseInt(process.env.END as string, 10),
	noFormulir: '2019.0003-003',
	jenisTransaksi: '0',
	tahunSPOP: '2019',
	noObjekPajak: '14.08.000.219.410-0001.3'
};

export default setupConfigs;
