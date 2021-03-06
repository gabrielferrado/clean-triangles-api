import { makeAddTriangleValidator } from './add-triangle-validator-factory'
import { ValidatorComposite , RequiredFieldValidator } from '@/validation/validators'
import { Validator } from '@/presentation/protocols'
import { Sides, TriangleValidator } from '@/validation/protocols/triangle-validator'
import { AddTriangleModel } from '@/domain/usecases/add-triangle'
import { TriangleSidesValidator } from '@/validation/validators/triangle-sides-validator'
import * as mockdate from 'mockdate'
import { TriangleTypes } from '@/domain/models/triangle'

jest.mock('@/validation/validators/validator-composite')

const VALID_TRIANGLE = {
  type: TriangleTypes.SCALENE,
  sides: [3,4,5],
  date: new Date()
}

const makeTriangleValidator = (): TriangleValidator => {
  class TriangleValidatorStub implements TriangleValidator {
    classify (sides: Sides): AddTriangleModel {
      return VALID_TRIANGLE
    }
  }
  return new TriangleValidatorStub()
}

describe('AddTriangleValidator Factory', function () {
  beforeAll(() => {
    mockdate.set(new Date())
  })

  test('Should call ValidationComposite with all validations', () => {
    const validations: Validator[] = []
    makeAddTriangleValidator()

    for (const field of ['side1', 'side2', 'side3']) {
      validations.push(new RequiredFieldValidator(field))
    }
    validations.push(new TriangleSidesValidator(makeTriangleValidator()))
    expect(ValidatorComposite).toHaveBeenCalledWith(validations)
  })
})
