import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm'
import { URL } from "url";

const dbUrl = new URL('postgresql://midlaj:C7OONMs0Oaip00yzei4D4A@bald-doe-5733.8nk.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full')
const routingId = dbUrl.searchParams.get("options");
dbUrl.searchParams.delete("options");

export const dataSourceOptions = {
    type: 'cockroachdb',
    url : dbUrl.toString(),
   ssl : true,
    extra: {
        options: routingId
    }

}

const dataSource = new DataSource({...dataSourceOptions} as DataSourceOptions)

export default dataSource;
// export const AppDataSource = new DataSource({
//   type: "cockroachdb",
//   url: dbUrl.toString(),
//   ssl: true,
//   extra: {
//     options: routingId
//   },
// });
