import Providers from "./providers/Providers";
import AppRoutes from "./routes";

export default function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}
