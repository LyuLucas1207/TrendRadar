/**
 * 通用配置验证工具
 * 只包含验证函数，Schema 定义在对应的包中
 */
import { z, type ZodType } from 'zod'

/**
 * 验证数据是否符合 schema
 * @param schema Zod schema
 * @param data 要验证的数据
 * @param name 配置名称（用于错误信息）
 * @throws Error 如果验证失败
 */
export function validate<T extends ZodType>(
  schema: T,
  data: unknown,
  name: string = 'Configuration'
): asserts data is z.infer<T> {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
        return `  - ${path}: ${issue.message}`
      })
      .join('\n')
    
    throw new Error(`${name} validation failed:\n${errors}`)
  }
}
