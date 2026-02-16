# Agent Rules & Governance

These rules are established to ensure code quality, stability, and maintainability. The Agent must follow these guidelines strictly.

## 1. No Broken Windows
- **Rule**: If a CI build fails, the immediate priority is to fix it. No new features should be implemented until the build is green.
- **Action**: Monitor `gh run list` after pushes. If red, revert or fix immediately.

## 2. Verify Locally First
- **Rule**: Never push to `main` without verifying that the application builds and runs locally.
- **Action**:
    - Frontend: Run `npm run build` in `frontend/`.
    - Backend: Run `npm start` (or at least `node --check server.js`) in `backend/`.

## 3. Atomic Commits & Separation of Concerns
- **Rule**: Changes to Frontend and Backend should ideally be in separate commits if they are loosely coupled.
- **Action**: Use `git add frontend/` and `git commit -m "feat(front): ..."` then `git add backend/` and `git commit -m "feat(back): ..."`.

## 4. Documentation as Code
- **Rule**: Keep `task.md` and `implementation_plan.md` updated.
- **Action**: Update `task.md` status before starting work. Update `implementation_plan.md` before writing code for new features.

## 5. Security First
- **Rule**: Never commit `.env` files or secrets.
- **Action**: Always double-check `git status` before adding. Use environment variables for all secrets.

## 6. Code Quality & Standards (v4+)
- **Rule**: Follow consistent coding styles and best practices.
- **Action**:
    - **Linting**: Ensure `eslint` passes before commit.
    - **Formatting**: Use Prettier (or similar) for consistent formatting.
    - **Clean Code**: Meaningful variable names, small functions, DRY principle.

## 7. Architecture Patterns
- **Rule**: Maintain strict separation of concerns.
- **Action**:
    - Backend: Controller -> Service -> Model.
    - Frontend: Components -> Custom Hooks (Logic) -> API Layer.

## 8. Testing Strategy
- **Rule**: Test critical paths and complex logic.
- **Action**:
    - **Unit**: Test utility functions and complex service logic (v6 goal, start small).
    - **Integration**: Test API endpoints (v6 goal).
    - **E2E**: Validate core user flows (Creating battle, Voting) (v6 goal).
