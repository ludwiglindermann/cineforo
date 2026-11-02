package cl.duoc.cineforo.usuarios.repository;

import cl.duoc.cineforo.usuarios.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Busca por nombre de usuario o por email (para el login). */
    @Query("SELECT u FROM Usuario u "
            + "WHERE LOWER(u.nombreUsuario) = LOWER(:valor) OR LOWER(u.email) = LOWER(:valor)")
    Optional<Usuario> buscarPorNombreOEmail(@Param("valor") String valor);

    List<Usuario> findByRol_NombreOrderByIdAsc(String nombreRol);

    boolean existsByNombreUsuarioIgnoreCase(String nombreUsuario);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRol_Id(Long rolId);
}
