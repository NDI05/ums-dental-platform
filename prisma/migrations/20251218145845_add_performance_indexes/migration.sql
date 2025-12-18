-- CreateIndex
CREATE INDEX "Comic_createdById_idx" ON "Comic"("createdById");

-- CreateIndex
CREATE INDEX "MiniGame_createdById_idx" ON "MiniGame"("createdById");

-- CreateIndex
CREATE INDEX "Quiz_categoryId_idx" ON "Quiz"("categoryId");

-- CreateIndex
CREATE INDEX "Quiz_createdById_idx" ON "Quiz"("createdById");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Video_createdById_idx" ON "Video"("createdById");
