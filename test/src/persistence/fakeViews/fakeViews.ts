import { Tables } from '../contants';
import { fakeData } from '../fakeData/fakeData';
import { generateViews } from './fakeViewsGenerator';

export const fakeViews= generateViews(fakeData);
