function MainContent({ children }) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      {children}
    </main>
  )
}

export default MainContent
