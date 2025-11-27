/**
 * User 领域实体
 * 类似 Sjgz-Backend 的 domain/user/write_model.go
 */
export interface UserEntity {
  id: string
  email: string
  type: 'github'
  data?: string
  created: number
  updated: number
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly type: 'github',
    public readonly data: string = '',
    public readonly created: number = Date.now(),
    public readonly updated: number = Date.now()
  ) {}

  updateEmail(email: string): User {
    return new User(
      this.id,
      email,
      this.type,
      this.data,
      this.created,
      Date.now()
    )
  }

  updateData(data: string): User {
    return new User(
      this.id,
      this.email,
      this.type,
      data,
      this.created,
      Date.now()
    )
  }

  toEntity(): UserEntity {
    return {
      id: this.id,
      email: this.email,
      type: this.type,
      data: this.data,
      created: this.created,
      updated: this.updated,
    }
  }

  static fromEntity(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.type,
      entity.data,
      entity.created,
      entity.updated
    )
  }
}

