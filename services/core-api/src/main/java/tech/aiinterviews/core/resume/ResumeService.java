package tech.aiinterviews.core.resume;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tech.aiinterviews.core.user.User;
import tech.aiinterviews.core.user.UserRepository;

import java.io.IOException;
import java.util.UUID;

@Service
public class ResumeService {

	private final UserRepository userRepository;
	private final ResumeTextExtractor extractor;
	private final ResumeAnonymizer anonymizer;

	public ResumeService(UserRepository userRepository, ResumeTextExtractor extractor, ResumeAnonymizer anonymizer) {
		this.userRepository = userRepository;
		this.extractor = extractor;
		this.anonymizer = anonymizer;
	}

	public ResumeText extract(UUID userId, MultipartFile file) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
		String text = anonymizer.anonymize(extractor.extract(read(file)), user.getName());
		if (text.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "No readable text in the file");
		}
		return new ResumeText(text);
	}

	private static byte[] read(MultipartFile file) {
		try {
			return file.getBytes();
		} catch (IOException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File could not be read", e);
		}
	}

}
