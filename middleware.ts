// Middleware dočasně vypnutý pro development testování.
// Pro produkci odkomentuj:
//
// import { withAuth } from "next-auth/middleware";
// export default withAuth({
//   pages: { signIn: "/login" },
// });
// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/feed/:path*",
//     "/study/:path*",
//     "/graph/:path*",
//     "/collections/:path*",
//     "/comparator/:path*",
//     "/agent/:path*",
//     "/alerts/:path*",
//     "/api/agent/:path*",
//   ],
// };

export function middleware() {
  // Auth bypassed for dev
}
