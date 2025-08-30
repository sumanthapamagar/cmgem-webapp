export function IsServiceEnabled(envVarName: string): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value
        descriptor.value = function (...args: any[]) {
            if (process.env[envVarName] !== "TRUE") {
                console.log("service is disabled:", envVarName)
                return null
            }

            console.log("service is enabled:", envVarName)
            return originalMethod.apply(this, args)
        }
        return descriptor
    }
}
