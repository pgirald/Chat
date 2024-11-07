import {
	Gen,
	InvalidParamsError,
	range,
	typedKeys,
	randElm,
	unique,
} from "./general";

test("Check Gen()", () => {
	let gen = Gen(2);
	expect(gen.start).toBe(2);
	expect(gen.next()).toBe(2);
	expect(gen.next()).toBe(3);
	expect(gen.next()).toBe(4);
	gen = Gen();
	expect(gen.start).toBe(1);
	expect(gen.next()).toBe(1);
	expect(gen.next()).toBe(2);
	expect(gen.next()).toBe(3);
	gen.start = 4;
	expect(gen.start).toBe(4);
	expect(gen.next()).toBe(4);
	expect(gen.next()).toBe(5);
	expect(gen.next()).toBe(6);
	gen.reset();
	expect(gen.start).toBe(4);
	expect(gen.next()).toBe(4);
	expect(gen.next()).toBe(5);
});

const obj: { one: string; two: string; three: number } = Object.create({
	protoProp: "moli",
});
obj.one = "one";
obj.two = "two";
obj.three = 3;

test.each([
	[{ one: 1, two: 2, three: "three" }, ["one", "two", "three"]],
	[obj, ["one", "two", "three"]],
])("Check typed keys", (obj, keys) => {
	expect(typedKeys(obj).every((k) => keys.includes(k)));
});

test.each<{
	start: number;
	end: number;
	expected: number[] | Error;
}>([
	{ start: 1, end: 5, expected: [1, 2, 3, 4, 5] },
	{ start: 0, end: 10, expected: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
	{ start: -5, end: 4, expected: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4] },
	{
		start: -50,
		end: 500,
		expected: Array.from({ length: 500 - -50 + 1 }, (_, index) => -50 + index),
	},
	{ start: 1, end: Infinity, expected: RangeError() }, //Invalid array lenght
	{ start: -Infinity, end: 4, expected: RangeError() }, //Invalid array lenght
	{ start: -Infinity, end: Infinity, expected: RangeError() }, //Invalid array lenght
	{ start: Infinity, end: 8, expected: new InvalidParamsError() }, //min must be greater than max
	{ start: NaN, end: 3, expected: RangeError() }, //Invalid array lenght
	{ start: -5, end: NaN, expected: RangeError() }, //Invalid array lenght
	{ start: NaN, end: NaN, expected: RangeError() }, //Invalid array lenght
])("Check range()", ({ start, end, expected }) => {
	if (expected instanceof Array) {
		expect(range(start, end)).toEqual(expected);
	} else if (expected instanceof Error) {
		expect(() => range(start, end)).toThrow((expected as any).constructor);
	}
});

test.each<{
	elms: any[];
	areEqual: (obj1: any, obj2: any) => boolean;
	expected: any[];
}>([
	{
		elms: [
			{ id: 1, name: "Pao" },
			{ id: 2, name: "Mao" },
			{ id: 3, name: "Cla" },
		],
		areEqual: (item1, item2) => item1.name === item2.name,
		expected: [
			{ id: 1, name: "Pao" },
			{ id: 2, name: "Mao" },
			{ id: 3, name: "Cla" },
		],
	},
	{
		elms: [
			{ id: 1, name: "Pao" },
			{ id: 1, name: "Mao" },
			{ id: 3, name: "Pao" },
		],
		areEqual: (item1, item2) => item1.id === item2.id,
		expected: [
			{ id: 1, name: "Pao" },
			{ id: 3, name: "Pao" },
		],
	},
	{
		elms: [
			{ id: 1, name: "Pao" },
			{ id: 2, name: "Pao" },
			{ id: 3, name: "Pao" },
		],
		areEqual: (item1, item2) => item1.name === item2.name,
		expected: [{ id: 1, name: "Pao" }],
	},
	{
		elms: [1, 2, 3, 2, 1],
		areEqual: (item1, item2) => item1 === item2,
		expected: [1, 2, 3],
	},
	{
		elms: [],
		areEqual: (item1, item2) => item1 === item2,
		expected: [],
	},
	{
		elms: [
			{ id: 1, name: "Pao" },
			{ id: 2, name: "Mao" },
			{ id: 3, name: "Pao" },
			{ id: 4, name: "Mao" },
		],
		areEqual: (item1, item2) => item1.name === item2.name,
		expected: [
			{ id: 1, name: "Pao" },
			{ id: 2, name: "Mao" },
		],
	},
	{
		elms: [
			{ id: 1, name: { first: "Pao" } },
			{ id: 2, name: { first: "Mao" } },
			{ id: 3, name: { first: "Pao" } },
		],
		areEqual: (item1, item2) => item1.name.first === item2.name.first,
		expected: [
			{ id: 1, name: { first: "Pao" } },
			{ id: 2, name: { first: "Mao" } },
		],
	},
])("Check unique()", ({ elms, areEqual, expected }) => {
	expect(unique(elms, areEqual)).toEqual(expected);
});

test.each<{ elms: any[]; expectedPossible: any[] }>([
	{
		elms: [1],
		expectedPossible: [1],
	},
	{
		elms: [1, 2, 3, 4, 5],
		expectedPossible: [1, 2, 3, 4, 5],
	},
	{
		elms: ["Pao", "Mao", "Cla"],
		expectedPossible: ["Pao", "Mao", "Cla"],
	},
	{
		elms: [
			{ id: 1, name: "Pao" },
			{ id: 2, name: "Mao" },
			{ id: 3, name: "Cla" },
		],
		expectedPossible: [
			{ id: 1, name: "Pao" },
			{ id: 2, name: "Mao" },
			{ id: 3, name: "Cla" },
		],
	},
	{
		elms: [1, 1, 2, 2, 3],
		expectedPossible: [1, 1, 2, 2, 3],
	},
	{
		elms: [],
		expectedPossible: [],
	},
])("Check randElm()", ({ elms, expectedPossible }) => {
	if (elms.length === 0) {
		expect(() => randElm(elms)).toThrow();
	} else {
		const result = randElm(elms);
		expect(expectedPossible).toContainEqual(result);
	}
});

test.each`
	startValue   | nextCalls | expectedValues  | shouldThrow
	${1}         | ${3}      | ${[1, 2, 3]}    | ${false}
	${10}        | ${2}      | ${[10, 11]}     | ${false}
	${-5}        | ${3}      | ${[-5, -4, -3]} | ${false}
	${0}         | ${4}      | ${[0, 1, 2, 3]} | ${false}
	${100}       | ${1}      | ${[100]}        | ${false}
	${NaN}       | ${1}      | ${null}         | ${true}
	${Infinity}  | ${1}      | ${null}         | ${true}
	${-Infinity} | ${1}      | ${null}         | ${true}
	${2.5}       | ${1}      | ${null}         | ${true}
	${"abc"}     | ${1}      | ${null}         | ${true}
`(
	"startValue: $startValue, nextCalls: $nextCalls, shouldThrow: $shouldThrow",
	({ startValue, nextCalls, expectedValues, shouldThrow }) => {
		if (shouldThrow) {
			expect(() => Gen(startValue)).toThrow();
		} else {
			const gen = Gen(startValue);
			const results = [];
			for (let i = 0; i < nextCalls; i++) {
				results.push(gen.next());
			}
			expect(results).toEqual(expectedValues);
		}
	}
);
