@echo off
echo 🌍 Setting up Multilingual Support for HelpeR
echo ==============================================
echo.

REM Step 1: Install dependencies
echo 📦 Step 1/4: Installing dependencies...
call pnpm install

REM Step 2: Generate Prisma Client
echo 🔧 Step 2/4: Generating Prisma Client...
call pnpm prisma generate

REM Step 3: Create database migration
echo 🗄️  Step 3/4: Creating database migration...
echo Running migration to add language support...
call pnpm prisma migrate dev --name add_multilingual_support

REM Step 4: Validate translation setup
echo ✅ Step 4/4: Validating translation setup...
call pnpm validate:translations

echo.
echo ✅ Multilingual support setup complete!
echo.
echo 📝 Next steps:
echo    1. Configure TRANSLATION_API_KEY in your .env file
echo    2. Implement translation API in lib/translationClient.ts
echo    3. Migrate your pages to app/[lang]/ structure
echo    4. See MULTILINGUAL_GUIDE.md for detailed instructions
echo.
echo 🚀 Happy translating!
pause
