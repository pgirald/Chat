import { Tables } from './contants';
import { fakeData } from './FakeData';
import { generateViews } from './fakeViewsGenerator';

export const fakeViews= generateViews(fakeData);
