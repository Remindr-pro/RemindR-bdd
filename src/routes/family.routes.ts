import { Router } from "express";
import { FamilyController } from "../controllers/family.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createFamilyMemberSchema,
  deleteFamilyMemberSchema,
  updateFamilyMemberSchema,
} from "../schemas/family.schema";

const router = Router();
const familyController = new FamilyController();

router.use(authenticate as any);

router.post(
  "/members",
  validate(createFamilyMemberSchema),
  familyController.createMember as any,
);
router.patch(
  "/members/:memberId",
  validate(updateFamilyMemberSchema),
  familyController.updateMember as any,
);
router.delete(
  "/members/:memberId",
  validate(deleteFamilyMemberSchema),
  familyController.deleteMember as any,
);
router.get("/me", familyController.getMyFamily as any);
router.get("/:id", familyController.getById as any);
router.put("/:id", familyController.update as any);

export default router;
