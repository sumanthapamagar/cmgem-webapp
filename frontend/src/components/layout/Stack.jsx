import clsx from "clsx"

export function Stack({children,horizontal = false,  className, ...props}){
    className = clsx( "flex", horizontal ? "flex-row": "flex-col", className)
    return (<div className={className}>
        {children}
    </div>)
}
