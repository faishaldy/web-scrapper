import { WorkBook } from 'xlsx';

import { TaskObject } from '../models';

export default function getWorkbook(
	workbook: WorkBook,
	order: number
): TaskObject {
	const worksheet = workbook.Sheets[workbook.SheetNames[0]];

	const taskObject: TaskObject = {
		namaBangunan: worksheet['B' + order.toString()].v,
		jenisBangunan: worksheet['C' + order.toString()].v,
		luasBangunan: worksheet['D' + order.toString()].v
	};

	return taskObject;
}
