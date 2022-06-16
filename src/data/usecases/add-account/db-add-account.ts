import { AccountModel, AddAccount, AddAccountModel, AddAccountRepository, Hasher } from './db-add-account-protocols'
import { LoadAccountByEmailRepository } from '../../protocols/db/account/load-account-by-email-repository'

export class DbAddAccount implements AddAccount {
  constructor (
    private readonly hasher: Hasher,
    private readonly addAccountRepository: AddAccountRepository,
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) {}

  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(accountData.email)
    if (!account) {
      const hashedPassword = await this.hasher.hash(accountData.password)
      return this.addAccountRepository.add(Object.assign({}, accountData, { password: hashedPassword }))
    }
    return null
  }
}
