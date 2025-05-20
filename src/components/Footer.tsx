export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-10">
      <div className="mx-auto py-4">
        <p className="text-center text-xs text-gray-500">
          &copy; {currentYear} Aliança Seguros. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
