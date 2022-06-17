import { TriangleModel } from '../models/triangle'

export enum TriangleTypes {
  EQUILATERAL = 'equilateral',
  ISOSCELES = 'isosceles',
  SCALENE = 'scalene'
}

export interface AddTriangleModel {
  type: TriangleTypes
  sides: number[]
}

export interface AddTriangle {
  add: (data: AddTriangleModel) => Promise<TriangleModel>
}
