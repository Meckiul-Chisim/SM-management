function MainContent({ children }) {
  return (
    <main className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
      {children}
    </main>
  )
}

export default MainContent
