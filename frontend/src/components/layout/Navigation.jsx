import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
export function Navigation({ navigation, className }) {
    let location = useLocation();
    return (
        <div className={clsx('text-lg', className)}>
            <ul role="list" className="space-y-4">
                {navigation.map((section) => (
                    <li key={section.key}>
                        <Link
                            className={clsx(
                                ' font-normal leading-8 hover:text-blue-800',
                                (location.pathname === section.href ||
                                    location.pathname.includes(section.key))
                                    ? 'text-blue-600'
                                    : 'text-zinc-600'
                            )}
                            to={section.href}
                        >
                            {section.iconClass && (
                                <i className={section.iconClass}></i>
                            )}
                            {section.title}
                        </Link>
                        {section.links && (
                            <ul
                                role="list"
                                className=" text-base ml-1 border-l-2 border-slate-300 "
                            >
                                {section.links.map((link) => (
                                    <li key={link.key} className="relative">
                                        <Link
                                            to={link.href}
                                            className={clsx(
                                                'block rounded-sm w-full ml-6 leading-8 px-3 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full hover:bg-neutral-200 hover:text-gray-800 ',
                                                link.href == location.pathname
                                                    ? 'bg-sky-200 text-gray-800 before:bg-sky-500'
                                                    : 'text-slate-800 before:hidden before:bg-slate-600 hover:text-slate-600 hover:before:block'
                                            )}
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
