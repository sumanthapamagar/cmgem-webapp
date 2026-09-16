import clsx from "clsx";
import { Stack } from "../layout/Stack";

export const ProgressBar = ({children, completed = 1}) => {
    return (
        <Stack>
            <div className="loader bg-gray-200 relative rounded-full h-2">
                <div 
                    className={
                        clsx(
                            " ease-in-out absolute  h-2 w-full",
                            completed == 1 ? 'bg-blue-500' : 'animate-pulse bg-linear-30 from-blue-200 to-blue-500'
                        )
                    }
                    style={{ width: `${(completed ) * 100}%` }}
                >
                </div>
            </div>
            {children}
        </Stack>
    );
};