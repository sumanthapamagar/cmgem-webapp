import webpack from "webpack"
import path from "path"
import nodeExternals from "webpack-node-externals"
import { RunScriptWebpackPlugin } from "run-script-webpack-plugin"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export default {
    entry: ["webpack/hot/poll?300", "./src/main.ts"],
    target: "node",
    externals: [
        nodeExternals({
            allowlist: [
                "webpack/hot/poll?300", 
                /shared-types/,
                /@nestjs\/.*/,
                /@azure\/.*/,
                /@microsoft\/.*/,
                /passport.*/,
                /mongoose/,
                /sharp/,
                /docx/,
                /xlsx.*/,
                /dayjs/,
                /axios/,
                /class-validator/,
                /class-transformer/,
                /reflect-metadata/,
                /rxjs/
            ]
        })
    ],
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    mode: "development",
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        alias: {
            src: path.resolve(__dirname, "src"),
            rootPath: path.resolve(__dirname, "src")
        },
        fallback: {
            "kerberos": false,
            "@mongodb-js/zstd": false,
            "@aws-sdk/credential-providers": false,
            "gcp-metadata": false,
            "snappy": false,
            "socks": false,
            "aws4": false,
            "mongodb-client-encryption": false,
            "@nestjs/websockets/socket-module": false,
            "@nestjs/microservices/microservices-module": false,
            "@nestjs/microservices": false
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new RunScriptWebpackPlugin({ name: "server.js", autoRestart: true }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^(kerberos|@mongodb-js\/zstd|@aws-sdk\/credential-providers|gcp-metadata|snappy|socks|aws4|mongodb-client-encryption)$/,
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^@nestjs\/(websockets|microservices)/,
        })
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "server.js"
    },
    watchOptions: {
        ignored: /node_modules\/(?!shared-types)/,
        aggregateTimeout: 300,
        poll: 1000
    },
    ignoreWarnings: [
        /Critical dependency: the request of a dependency is an expression/,
        /Module not found: Error: Can't resolve/,
        /Can't resolve 'kerberos'/,
        /Can't resolve '@mongodb-js\/zstd'/,
        /Can't resolve '@aws-sdk\/credential-providers'/,
        /Can't resolve 'gcp-metadata'/,
        /Can't resolve 'snappy'/,
        /Can't resolve 'socks'/,
        /Can't resolve 'aws4'/,
        /Can't resolve 'mongodb-client-encryption'/,
        /Can't resolve '@nestjs\/websockets\/socket-module'/,
        /Can't resolve '@nestjs\/microservices\/microservices-module'/,
        /Can't resolve '@nestjs\/microservices'/
    ]
}
