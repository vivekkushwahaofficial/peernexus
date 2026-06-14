package com.peernexus.peernexus;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
		"spring.jpa.hibernate.ddl-auto=update",
		"spring.flyway.enabled=false",
		"JWT_SECRET=TEST_JWT_SECRET_FOR_UNIT_TESTS",
		"DB_PASSWORD=TEST_DB_PASSWORD",
		"CLOUDINARY_API_SECRET=development-secret"
})
class PeernexusApplicationTests {

	@Test
	void contextLoads() {
	}

}
