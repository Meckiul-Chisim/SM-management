// tabIndex={-1} lets the skip link (and route changes) move focus here.
function MainContent({ children }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1240px] px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-10 lg:py-10"
    >
      {children}
    </main>
  )
}

export default MainContent
