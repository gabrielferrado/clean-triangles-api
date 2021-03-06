import { DbAuthentication } from './db-authentication'
import {
  AccountModel,
  Authenticator,
  HashComparer,
  LoadAccountByEmailRepository,
  Encryptor,
  UpdateAccessTokenRepository
} from './db-authentication-protocols'

const VALID_AUTH = {
  email: 'any_email@mail.com',
  password: 'any_password'
}
const VALID_ACCOUNT = {
  email: 'any_email',
  password: 'hashed_password',
  name: 'any_name',
  id: 'any_id'
}

interface SutTypes {
  sut: Authenticator
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashComparerStub: HashComparer
  encryptorStub: Encryptor
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
}

const makeLoadAccountStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel> {
      return Promise.resolve(VALID_ACCOUNT)
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}
const makeHashComparerStub = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return Promise.resolve(true)
    }
  }
  return new HashComparerStub()
}
const makeEncryptorStub = (): Encryptor => {
  class EncryptorStub implements Encryptor {
    async encrypt (id: string): Promise<string> {
      return Promise.resolve('any_token')
    }
  }
  return new EncryptorStub()
}
const makeUpdateAccessTokenRepositoryStub = (): UpdateAccessTokenRepository => {
  class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
    async updateAccessToken (id: string, token: string): Promise<void> {
      return Promise.resolve()
    }
  }
  return new UpdateAccessTokenRepositoryStub()
}

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountStub()
  const hashComparerStub = makeHashComparerStub()
  const encryptorStub = makeEncryptorStub()
  const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepositoryStub()
  const sut = new DbAuthentication(
    loadAccountByEmailRepositoryStub,
    hashComparerStub,
    encryptorStub,
    updateAccessTokenRepositoryStub
  )
  return {
    sut,
    loadAccountByEmailRepositoryStub,
    hashComparerStub,
    encryptorStub,
    updateAccessTokenRepositoryStub
  }
}

describe('DbAuthentication use case', function () {
  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    await sut.auth(VALID_AUTH)
    expect(loadSpy).toHaveBeenCalledWith(VALID_AUTH.email)
  })

  test('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
      .mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.auth(VALID_AUTH)
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if LoadAccountByEmailRepository could not find an account', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(null)
    const accessToken = await sut.auth(VALID_AUTH)
    expect(accessToken).toBeNull()
  })

  test('Should call HashCompare with correct values', async () => {
    const { sut, hashComparerStub } = makeSut()
    const compareSpy = jest.spyOn(hashComparerStub, 'compare')
    await sut.auth(VALID_AUTH)
    expect(compareSpy).toHaveBeenCalledWith(VALID_AUTH.password, VALID_ACCOUNT.password)
  })

  test('Should throw if HashCompare throws', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare')
      .mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.auth(VALID_AUTH)
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if HashCompare returns false', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest
      .spyOn(hashComparerStub, 'compare')
      .mockReturnValueOnce(Promise.resolve(false))
    const accessToken = await sut.auth(VALID_AUTH)
    expect(accessToken).toBeNull()
  })

  test('Should call Encryptor with correct values', async () => {
    const { sut, encryptorStub } = makeSut()
    const generateSpy = jest.spyOn(encryptorStub, 'encrypt')
    await sut.auth(VALID_AUTH)
    expect(generateSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should throw if Encryptor throws', async () => {
    const { sut, encryptorStub } = makeSut()
    jest.spyOn(encryptorStub, 'encrypt')
      .mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.auth(VALID_AUTH)
    await expect(promise).rejects.toThrow()
  })

  test('Should return a token if everything succeeds', async () => {
    const { sut } = makeSut()
    const accessToken = await sut.auth(VALID_AUTH)
    expect(accessToken).toBe('any_token')
  })

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken')
    await sut.auth(VALID_AUTH)
    expect(updateSpy).toHaveBeenCalledWith(VALID_ACCOUNT.id, 'any_token')
  })

  test('Should throw if UpdateAccessTokenRepository throws', async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut()
    jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken')
      .mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.auth(VALID_AUTH)
    await expect(promise).rejects.toThrow()
  })
})
