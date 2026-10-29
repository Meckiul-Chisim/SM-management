function MainContent({ children }) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1280px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9 lg:py-10">
      {children}
    </main>
  )
}

export default MainContent
