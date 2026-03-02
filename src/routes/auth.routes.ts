import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  patchMeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyPasswordSchema,
  changePasswordSchema,
  activateAccountSchema,
  resendActivationSchema,
  verifyIdentitySchema,
} from "../schemas/auth.schema";

const router = Router();
const authController = new AuthController();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post(
  "/verify-password",
  authenticate as any,
  validate(verifyPasswordSchema),
  authController.verifyPassword as any,
);
router.post(
  "/change-password",
  authenticate as any,
  validate(changePasswordSchema),
  authController.changePassword as any,
);
router.post(
  "/activate",
  validate(activateAccountSchema),
  authController.activateAccount,
);
router.post(
  "/resend-activation",
  validate(resendActivationSchema),
  authController.resendActivation,
);
router.post(
  "/verify-identity",
  validate(verifyIdentitySchema),
  authController.verifyIdentity,
);
router.post("/logout", authenticate as any, authController.logout as any);
router.get("/me", authenticate as any, authController.getMe as any);
router.patch(
  "/me",
  authenticate as any,
  validate(patchMeSchema),
  authController.patchMe as any,
);
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);
router.get("/apple", authController.appleAuth);
router.get("/apple/callback", authController.appleCallback);

export default router;
