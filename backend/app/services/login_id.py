# app/services/login_id.py
"""Login ID generation service.

Format: [COMPANY_PREFIX][FIRST2_FIRST_NAME + FIRST2_LAST_NAME][YEAR_OF_JOINING][SERIAL]
Example: OIJODO20220001

- OI        → Company prefix (from settings.COMPANY_LOGIN_PREFIX)
- JODO      → First 2 chars of first name "John" + first 2 chars of last name "Doe"
- 2022      → Year of joining
- 0001      → Serial number for that year (zero-padded to 4 digits)
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.employee import Employee


def _extract_name_code(full_name: str) -> str:
    """Extract first 2 letters of first name + first 2 letters of last name.

    Falls back gracefully:
    - Single name "John" → "JO" (first 2 of that name, padded if needed)
    - Multi-word "John Michael Doe" → first 2 of "John" + first 2 of "Doe" (last word)
    """
    parts = full_name.strip().split()
    if len(parts) >= 2:
        first_part = parts[0][:2].upper()
        last_part = parts[-1][:2].upper()
    else:
        # Single name — use first 2 chars twice, padded with X
        first_part = parts[0][:2].upper().ljust(2, "X")
        last_part = first_part
    return f"{first_part}{last_part}"


async def generate_login_id(
    db: AsyncSession,
    full_name: str,
    join_year: int,
) -> str:
    """Generate a unique login ID for a new employee."""
    prefix = settings.COMPANY_LOGIN_PREFIX
    name_code = _extract_name_code(full_name)
    year_str = str(join_year)

    # Find the max existing serial for this year
    pattern = f"{prefix}%{year_str}%"
    stmt = (
        select(func.count())
        .select_from(Employee)
        .where(Employee.employee_code.like(pattern))
    )
    result = await db.execute(stmt)
    count = result.scalar_one()
    serial = str(count + 1).zfill(4)

    return f"{prefix}{name_code}{year_str}{serial}"
