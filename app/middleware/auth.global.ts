export default defineNuxtRouteMiddleware(async (to) => {
  // ดึง session โดยให้ส่ง cookie ไปด้วย
  const session = await authClient.getSession({
    fetchOptions: {
      headers: useRequestHeaders(["cookie"]) // สำคัญ!!
    }
  });

  // console.log(session);
  
  // ถ้าไม่เจอ session
  if (!session.data || session.error) {
    if (to.path !== "/login" && to.path !== "/sign-up") {
      return navigateTo("/login");
    }
  }

  // ถ้า login แล้ว แต่ดันจะเข้าหน้า login → redirect ไปหน้า home
  if (session.data && (to.path === "/login" || to.path === "/Login")) {
    return navigateTo("/");
  }
});