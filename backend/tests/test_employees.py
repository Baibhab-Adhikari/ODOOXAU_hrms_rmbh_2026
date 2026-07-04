import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_and_get_employee(client: AsyncClient):
    """Test HR can create an employee and fetch it."""
    # First, sign up as HR
    signup_data = {
        "company_name": "Employee Test Company",
        "full_name": "Employee HR",
        "email": "employeehr@test.com",
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!"
    }
    res = await client.post("/auth/signup", json=signup_data)
    assert res.status_code == 201
    hr_token = res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {hr_token}"}
    
    # Create employee
    employee_data = {
        "email": "newemp@test.com",
        "full_name": "New Employee",
        "department": "Engineering",
        "job_title": "Developer",
        "date_of_joining": "2026-01-01"
    }
    res = await client.post("/employees", json=employee_data, headers=headers)
    assert res.status_code == 201, res.text
    emp_res = res.json()
    assert "login_id" in emp_res
    emp_id = emp_res["id"]
    
    # Get employee
    res = await client.get(f"/employees/{emp_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == "newemp@test.com"

@pytest.mark.asyncio
async def test_employee_cannot_create_employee(client: AsyncClient):
    """Test Employee cannot create another employee."""
    # HR signs up
    res = await client.post("/auth/signup", json={
        "company_name": "Another Test Company",
        "full_name": "Another HR",
        "email": "anotherhr@test.com",
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!"
    })
    hr_token = res.json()["access_token"]
    hr_headers = {"Authorization": f"Bearer {hr_token}"}
    
    # Create employee
    emp_res = await client.post("/employees", json={
        "email": "emp2@test.com",
        "full_name": "Emp 2",
        "department": "Engineering",
        "job_title": "Developer",
        "date_of_joining": "2026-01-01"
    }, headers=hr_headers)
    assert emp_res.status_code == 201
    emp_data = emp_res.json()
    
    # Login as employee
    login_res = await client.post("/auth/login", json={
        "identifier": "emp2@test.com",
        "password": emp_data["temporary_password"]
    })
    assert login_res.status_code == 200
    emp_token = login_res.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    
    # Try to create employee as employee
    res = await client.post("/employees", json={
        "email": "emp3@test.com",
        "full_name": "Emp 3",
        "department": "Engineering",
        "job_title": "Developer",
        "date_of_joining": "2026-01-01"
    }, headers=emp_headers)
    assert res.status_code == 403
