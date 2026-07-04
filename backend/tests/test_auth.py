import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_signup_creates_hr_admin(client: AsyncClient):
    """Test that a new company and HR admin can be registered."""
    signup_data = {
        "company_name": "Test Company",
        "full_name": "Test HR",
        "email": "hr@testcompany.com",
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!"
    }
    
    response = await client.post("/auth/signup", json=signup_data)
    assert response.status_code == 201, f"Response: {response.text}"
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["actor_type"] == "hr_officer"

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test login functionality."""
    # First, sign up
    signup_data = {
        "company_name": "Login Test Company",
        "full_name": "Login HR",
        "email": "loginhr@test.com",
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!"
    }
    await client.post("/auth/signup", json=signup_data)
    
    # Then login
    login_data = {
        "identifier": "loginhr@test.com",
        "password": "StrongPassword123!"
    }
    response = await client.post("/auth/login", json=login_data)
    assert response.status_code == 200, f"Response: {response.text}"
    
    data = response.json()
    assert "access_token" in data
    assert data["actor_type"] == "hr_officer"

@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    """Test login with wrong password."""
    # First, sign up
    signup_data = {
        "company_name": "Invalid Login Test Company",
        "full_name": "Invalid HR",
        "email": "invalidhr@test.com",
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!"
    }
    await client.post("/auth/signup", json=signup_data)
    
    login_data = {
        "identifier": "invalidhr@test.com",
        "password": "WrongPassword!"
    }
    response = await client.post("/auth/login", json=login_data)
    assert response.status_code == 401
