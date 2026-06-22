const fs = require('fs');
const path = require('path');

const langsDir = path.join(__dirname, 'src', 'i18n', 'languages');
const files = fs.readdirSync(langsDir).filter(f => f.endsWith('.ts'));

const authVi = `  auth: {
    loginTitle: "Đăng nhập",
    registerTitle: "Đăng ký",
    displayNamePlaceholder: "Tên hiển thị",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Mật khẩu",
    loginButton: "Đăng nhập",
    registerButton: "Đăng ký",
    or: "Hoặc",
    googleSignIn: "Tiếp tục với Google",
    noAccount: "Chưa có tài khoản? Đăng ký",
    haveAccount: "Đã có tài khoản? Đăng nhập",
    loginSuccess: "Đăng nhập thành công",
    registerSuccess: "Đăng ký thành công",
    displayNameRequired: "Vui lòng nhập tên hiển thị",
    genericError: "Có lỗi xảy ra, vui lòng thử lại",
  },
  onboarding: {
    title: "Chào mừng bạn",
    gpsPrompt: "Vui lòng cấp quyền vị trí để trải nghiệm tốt nhất.",
    selectLanguage: "Chọn ngôn ngữ",
    continue: "Tiếp tục",
  },
`;

const authEn = `  auth: {
    loginTitle: "Login",
    registerTitle: "Register",
    displayNamePlaceholder: "Display Name",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    loginButton: "Login",
    registerButton: "Register",
    or: "Or",
    googleSignIn: "Continue with Google",
    noAccount: "No account? Register",
    haveAccount: "Have an account? Login",
    loginSuccess: "Login successful",
    registerSuccess: "Registration successful",
    displayNameRequired: "Please enter a display name",
    genericError: "An error occurred, please try again",
  },
  onboarding: {
    title: "Welcome",
    gpsPrompt: "Please grant location permission for the best experience.",
    selectLanguage: "Select Language",
    continue: "Continue",
  },
`;

for (const file of files) {
  const filePath = path.join(langsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find the last closing brace before export default
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex !== -1) {
    const toInsert = (file === 'vi.ts') ? authVi : authEn;
    // Don't insert if already there
    if (!content.includes('auth: {')) {
      content = content.substring(0, lastBraceIndex) + toInsert + content.substring(lastBraceIndex);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${file}`);
    }
  }
}
