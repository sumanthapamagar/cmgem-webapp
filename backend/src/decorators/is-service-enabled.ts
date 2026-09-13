export function IsServiceEnabled(envVarName: string): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value
        descriptor.value = function (...args: any[]) {
            if (process.env[envVarName] !== "TRUE") {
                return null
            }

            return originalMethod.apply(this, args)
        }
        return descriptor
    }
}
