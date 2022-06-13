import { DbAddAccount } from './db-add-account'
import { AccountModel, AddAccountModel, Encryptor, AddAccountRepository } from './db-add-account-protocols'

const ACCOUNT_DATA = {
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
}

interface SutTypes {
  sut: DbAddAccount
  encryptorStub: Encryptor
  addAccountRepositoryStub: AddAccountRepository
}

const makeEncryptor = (): Encryptor => {
  class EncryptorStub {
    async encrypt (value: string): Promise<string> {
      return new Promise((resolve) => resolve('hashed_password'))
    }
  }
  return new EncryptorStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'hashed_password'
      }
      return new Promise(resolve => resolve(fakeAccount))
    }
  }
  return new AddAccountRepositoryStub()
}

const makeSut = (): SutTypes => {
  const encryptorStub = makeEncryptor()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const sut = new DbAddAccount(encryptorStub, addAccountRepositoryStub)
  return {
    sut,
    encryptorStub,
    addAccountRepositoryStub
  }
}

describe('DbAddAccount UseCase', function () {
  test('Should call Encryptor with correct password', async () => {
    const { sut, encryptorStub } = makeSut()
    const encryptSpy = jest.spyOn(encryptorStub, 'encrypt')
    await sut.add(ACCOUNT_DATA)
    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Encryptor throws', async () => {
    const { sut, encryptorStub } = makeSut()
    jest.spyOn(encryptorStub, 'encrypt').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    )
    const promise = sut.add(ACCOUNT_DATA)
    await expect(promise).rejects.toThrow()
  })

  test('Should add AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
    await sut.add(ACCOUNT_DATA)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
  })

  test('Should throw if AddAccountRepository throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    )
    const promise = sut.add(ACCOUNT_DATA)
    await expect(promise).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const account = await sut.add(ACCOUNT_DATA)
    expect(account).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
  })
})
