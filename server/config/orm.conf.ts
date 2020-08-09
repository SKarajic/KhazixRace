export const OrmConfiguration = {
  type: 'sqlite',
  database: 'data/db.sqlite',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
} as any