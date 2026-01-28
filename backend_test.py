#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class EbookAPITester:
    def __init__(self, base_url="https://topicpages.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_chapter_id = None

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict[Any, Any]] = None, params: Optional[Dict[str, str]] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {"message": "Success (no JSON response)"}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:500]}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API", "GET", "api/", 200)

    def test_get_chapters_empty(self):
        """Test getting chapters (should work even if empty)"""
        return self.run_test("Get Chapters (Initial)", "GET", "api/chapters", 200)

    def test_create_chapter(self):
        """Test creating a new chapter"""
        chapter_data = {
            "title": "Test Photosynthesis Chapter",
            "subject": "science",
            "description": "A test chapter about photosynthesis process",
            "content": """# Introduction to Photosynthesis
Photosynthesis is the process by which plants convert sunlight into energy.

## Light Reactions
The light reactions occur in the thylakoids and produce ATP and NADPH.

## Calvin Cycle
The Calvin cycle uses ATP and NADPH to produce glucose from carbon dioxide."""
        }
        
        success, response = self.run_test("Create Chapter", "POST", "api/chapters", 200, chapter_data)
        if success and response.get("id"):
            self.created_chapter_id = response["id"]
            print(f"   Created chapter ID: {self.created_chapter_id}")
        return success, response

    def test_get_chapters_with_data(self):
        """Test getting chapters after creating one"""
        success, response = self.run_test("Get Chapters (With Data)", "GET", "api/chapters", 200)
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} chapters")
            return True, response
        elif success and isinstance(response, list):
            print(f"   No chapters found (empty list)")
            return True, response
        return False, {}

    def test_get_specific_chapter(self):
        """Test getting a specific chapter"""
        if not self.created_chapter_id:
            print("⚠️  Skipping - No chapter ID available")
            return True, {}
        
        return self.run_test("Get Specific Chapter", "GET", f"api/chapters/{self.created_chapter_id}", 200)

    def test_favorite_chapter(self):
        """Test toggling chapter favorite status"""
        if not self.created_chapter_id:
            print("⚠️  Skipping - No chapter ID available")
            return True, {}
        
        # Test setting favorite to true
        favorite_data = {"favorite": True}
        success1, response1 = self.run_test("Set Chapter Favorite (True)", "PUT", 
                                          f"api/chapters/{self.created_chapter_id}/favorite", 
                                          200, favorite_data)
        
        if not success1:
            return False, {}
        
        # Test setting favorite to false
        favorite_data = {"favorite": False}
        success2, response2 = self.run_test("Set Chapter Favorite (False)", "PUT", 
                                          f"api/chapters/{self.created_chapter_id}/favorite", 
                                          200, favorite_data)
        
        return success2, response2

    def test_update_topic_hotspots(self):
        """Test updating topic hotspots"""
        if not self.created_chapter_id:
            print("⚠️  Skipping - No chapter ID available")
            return True, {}
        
        # First get the chapter to find a topic ID
        success, chapter_data = self.test_get_specific_chapter()
        if not success or not chapter_data.get("topics"):
            print("⚠️  Skipping - No topics found in chapter")
            return True, {}
        
        topic_id = chapter_data["topics"][0]["id"]
        
        # Update topic with new hotspots
        update_data = {
            "hotspots": [
                {
                    "id": "test-hotspot-1",
                    "x": 25.0,
                    "y": 30.0,
                    "label": "Sunlight",
                    "icon": "sun",
                    "color": "warning",
                    "title": "Solar Energy",
                    "description": "The sun provides energy for photosynthesis",
                    "fun_fact": "The sun produces more energy in one second than humans have used in all of history!"
                }
            ]
        }
        
        return self.run_test("Update Topic Hotspots", "PUT", 
                           f"api/chapters/{self.created_chapter_id}/topics/{topic_id}", 
                           200, update_data)

    def test_delete_chapter(self):
        """Test deleting a chapter"""
        if not self.created_chapter_id:
            print("⚠️  Skipping - No chapter ID available")
            return True, {}
        
        return self.run_test("Delete Chapter", "DELETE", f"api/chapters/{self.created_chapter_id}", 200)

    def test_image_generation_models(self):
        """Test getting available image generation models"""
        return self.run_test("Get Available Models", "GET", "api/available-models", 200)

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Ebook API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test chapters CRUD operations
        self.test_get_chapters_empty()
        self.test_create_chapter()
        self.test_get_chapters_with_data()
        self.test_get_specific_chapter()
        
        # Test favorite functionality
        self.test_favorite_chapter()
        
        # Test topic editing
        self.test_update_topic_hotspots()
        
        # Test image generation endpoints
        self.test_image_generation_models()
        
        # Test deletion (do this last)
        self.test_delete_chapter()

        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = EbookAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())