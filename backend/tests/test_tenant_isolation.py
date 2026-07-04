import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_tenant_isolation(client: AsyncClient):
    """Test that HR from Company A cannot see employees from Company B."""
    
    # 1. Sign up Company A and its HR
    res_a = await client.post("/auth/signup", json={
        "company_name": "Alpha Corp",
        "full_name": "HR Alpha",
        "email": "hra@alphacorp.com",
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!"
    })
    assert res_a.status_code == 201
    hr_a_token = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {hr_a_token}"}
    
    # 2. Sign up Company B and its HR
    res_b = await client.post("/auth/signup", json={
        "company_name": "Beta Corp",
        "full_name": "HR Beta",
        "email": "hrb@betacorp.com",
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!"
    })
    assert res_b.status_code == 201
    hr_b_token = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {hr_b_token}"}
    
    # 3. HR A creates Employee A
    res_emp_a = await client.post("/employees", json={
        "email": "empa@companya.com",
        "full_name": "Employee A",
        "department": "Engineering",
        "job_title": "Developer",
        "date_of_joining": "2026-01-01"
    }, headers=headers_a)
    assert res_emp_a.status_code == 201
    emp_a_id = res_emp_a.json()["id"]
    
    # 4. HR B creates Employee B
    res_emp_b = await client.post("/employees", json={
        "email": "empb@companyb.com",
        "full_name": "Employee B",
        "department": "Sales",
        "job_title": "Executive",
        "date_of_joining": "2026-02-01"
    }, headers=headers_b)
    assert res_emp_b.status_code == 201
    emp_b_id = res_emp_b.json()["id"]
    
    # 5. HR A tries to get their own employees (should only see Employee A)
    res_get_a = await client.get("/employees", headers=headers_a)
    assert res_get_a.status_code == 200
    emps_a = res_get_a.json()
    assert len(emps_a) == 1
    assert emps_a[0]["id"] == emp_a_id
    
    # 6. HR A tries to get Employee B by ID (should be 404 Not Found since it's filtered)
    res_get_b_by_a = await client.get(f"/employees/{emp_b_id}", headers=headers_a)
    assert res_get_b_by_a.status_code == 404
    
    # 7. Check Dashboard logic for Company B
    res_dash_b = await client.get("/dashboard/hr", headers=headers_b)
    assert res_dash_b.status_code == 200
    dash_data = res_dash_b.json()
    assert dash_data["total_employees"] == 1
    assert dash_data["department_stats"][0]["dept"] == "Sales"
