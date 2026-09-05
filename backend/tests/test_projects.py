import pytest


def test_create_project(client):
    response = client.post(
        "/api/v1/projects",
        json={"name": "GeM Test Project", "gem_tender_id": "GEM-2025-001"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "GeM Test Project"
    assert data["gem_tender_id"] == "GEM-2025-001"
    assert data["status"] == "active"
    assert "id" in data
    assert "created_at" in data


def test_create_project_minimal(client):
    response = client.post("/api/v1/projects", json={"name": "Minimal Project"})
    assert response.status_code == 201
    assert response.json()["name"] == "Minimal Project"


def test_create_project_missing_name(client):
    response = client.post("/api/v1/projects", json={"description": "No name"})
    assert response.status_code == 422


def test_get_project(client):
    create = client.post("/api/v1/projects", json={"name": "Fetch Me"})
    project_id = create.json()["id"]

    response = client.get(f"/api/v1/projects/{project_id}")
    assert response.status_code == 200
    assert response.json()["id"] == project_id
    assert response.json()["name"] == "Fetch Me"


def test_get_project_not_found(client):
    response = client.get("/api/v1/projects/99999")
    assert response.status_code == 404


def test_list_projects(client):
    client.post("/api/v1/projects", json={"name": "P1"})
    client.post("/api/v1/projects", json={"name": "P2"})

    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["projects"]) >= 2
