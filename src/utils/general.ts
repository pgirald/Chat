import { faker } from "@faker-js/faker";

export class InvalidParamsError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "InvalidParamsError";
	}
}

export function range(start: number, end: number): number[] {
	if (start > end) {
		throw new InvalidParamsError("Start cannot be greater than end");
	}
	const len = Math.abs(end - start + 1);
	const arr = Array(len);
	for (let i = 0; i < len; i++) {
		arr[i] = start + i;
	}
	return arr;
}

export function typedKeys<T extends object>(obj: T): (keyof T)[] {
	return Object.keys(obj) as (keyof T)[];
}

export function Gen(start: number = 1) {
	validate(start);
	let st = start;
	let current = st;
	return {
		next() {
			return current++;
		},
		reset() {
			current = st;
		},
		set start(value: number) {
			validate(value);
			st = value;
		},
		get start() {
			return st;
		},
	};

	function validate(value: Number) {
		if (
			Number.isNaN(value) ||
			!Number.isFinite(value) ||
			!Number.isInteger(value)
		) {
			throw new InvalidParamsError(
				`The given number is not an integer or has an invalid
				value(NaN, (+|-)Infinity)`
			);
		}
	}
}

export function randElm<T>(elms: T[]) {
	return elms[faker.number.int(elms.length - 1)];
}

export function unique<T>(
	elms: T[],
	areEqual: (elm1: T, elm2: T) => boolean
): T[] {
	return elms.reduce<T[]>((acc, current) => {
		const x = acc.find((item) => areEqual(item, current)); // or use item.name === current.name
		if (!x) {
			acc.push(current);
		}
		return acc;
	}, []);
}
