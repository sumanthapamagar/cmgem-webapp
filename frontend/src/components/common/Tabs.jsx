import clsx from "clsx";

export function Tabs({ tabs,  selectedTab , setSelectedTab }) {

  return (
    <div className=" z-1">
      <nav className="isolate flex divide-x divide-gray-200 shadow-sm" aria-label="Tabs">
        {tabs.map((tab, tabIdx) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={clsx(
              selectedTab === tab.key ? 'bg-sky-400' : 'bg-stone-100 hover:text-gray-700',
              'py-2 text-base group relative min-w-0 flex-1 overflow-hidden text-center font-medium hover:bg-gray-100 '
            )}
            aria-current={tab.current ? 'page' : undefined}
          >
            <span>{tab.text}</span>
            <span
              aria-hidden="true"
              className={clsx(
                selectedTab === tab.key ? 'bg-indigo-500' : 'bg-transparent',
                'absolute inset-x-0 bottom-0 h-0.5'
              )}
            />
          </button>
        ))}
      </nav>
    </div>
  )
}