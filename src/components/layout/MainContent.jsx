function MainContent({ children }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="haven-main mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1480px] px-4 py-6 outline-none sm:px-7 sm:py-8 xl:px-10"
    >
      <div className="haven-page-content workspace-enter">{children}</div>
    </main>
  )
}

export default MainContent
