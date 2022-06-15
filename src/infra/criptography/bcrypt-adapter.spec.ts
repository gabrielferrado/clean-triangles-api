import bcrypt from 'bcrypt'
import { BCryptAdapter } from './bcrypt-adapter'

const DEFAULT_VALUE = 'any_value'
const DEFAULT_HASH = 'any_hash'
const SALT = 12

const makeSut = (): BCryptAdapter => {
  return new BCryptAdapter(SALT)
}

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return Promise.resolve(DEFAULT_HASH)
  },
  async compare (): Promise<boolean> {
    return Promise.resolve(true)
  }
}))

describe('BCrypt Adapter', function () {
  test('Should call hash with correct value', async () => {
    const sut = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    await sut.hash(DEFAULT_VALUE)
    expect(hashSpy).toHaveBeenCalledWith(DEFAULT_VALUE, SALT)
  })

  test('Should return a valid hash on hash success', async () => {
    const sut = makeSut()
    const hash = await sut.hash(DEFAULT_VALUE)
    expect(hash).toBe(DEFAULT_HASH)
  })

  test('Should a throw if bcrypt throws', async () => {
    const sut = makeSut()
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => {
      return Promise.reject(new Error())
    })
    const hash = sut.hash(DEFAULT_VALUE)
    await expect(hash).rejects.toThrow()
  })

  test('Should call compare with correct value', async () => {
    const sut = makeSut()
    const compareSpy = jest.spyOn(bcrypt, 'compare')
    await sut.compare(DEFAULT_VALUE, DEFAULT_HASH)
    expect(compareSpy).toHaveBeenCalledWith(DEFAULT_VALUE, DEFAULT_HASH)
  })

  test('Should return true if compare succeeds', async () => {
    const sut = makeSut()
    const isValid = await sut.compare(DEFAULT_VALUE, DEFAULT_HASH)
    expect(isValid).toBe(true)
  })
})
