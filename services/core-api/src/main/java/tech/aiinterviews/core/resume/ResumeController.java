package tech.aiinterviews.core.resume;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

	private final ResumeService resumeService;

	public ResumeController(ResumeService resumeService) {
		this.resumeService = resumeService;
	}

	@PostMapping(path = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResumeText extract(@AuthenticationPrincipal Jwt jwt, @RequestParam MultipartFile file) {
		return resumeService.extract(UUID.fromString(jwt.getSubject()), file);
	}

}
